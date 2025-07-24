const { User, Role, RefreshToken, AuditLog, sequelize } = require('../models'); // Make sure this path is correct
const { hashPassword, comparePassword } = require('../../shared/utils/bcrypt');
const InvalidCredentialsError = require('../../shared/utils/errors/InvalidCredentialsError');
const { Op } = require('sequelize');
const { verifyRefreshToken, generateTokenPair } = require('../../shared/config/jwt');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
const nowJKT = dayjs().tz('Asia/Jakarta');

class AuthService {
    async login(email, password, ipAddress, userAgent) {
        try {
            if (!User) {
                throw new Error('User model is undefined - check models import');
            }

            const user = await User.findOne({
                where: {
                    email,
                    is_active: true
                },
                include: [{
                    model: Role,
                    as: 'Role'
                }]
            });

            if (!user) {
                await this.logActivity(null, "LOGIN_FAILED", null, null, null, null, ipAddress, userAgent);
                throw new InvalidCredentialsError();
            }

            const isValid = await comparePassword(password, user.password);
            if (!isValid) {

                await this.logActivity(user.id, "LOGIN_FAILED", null, null, null, null, ipAddress, userAgent);
                throw new InvalidCredentialsError();
            }


            const payload = {
                id: user.id,
                email: user.email,
                role: user.Role.name,
                permissions: user.Role.permissions || {}
            };

            const tokens = generateTokenPair(payload);
            await this.storeRefreshToken(user.id, tokens.refreshToken);

            await this.logActivity(user.id, "LOGIN_SUCCESS", null, null, null, null, ipAddress, userAgent);

            return {
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    accessTokenExpiresIn: tokens.accessTokenExpiresIn,
                    refreshTokenExpiresIn: tokens.refreshTokenExpiresIn
                },
                employee: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.Role.name
                }
            };
        } catch (err) {
            console.error('Full error caught:', err);
            throw new Error(`Login failed: ${err?.message ?? 'Unknown error'}`);
        }
    }

    async storeRefreshToken(userId, token, transaction = null) {
        try {
            await RefreshToken.upsert({
                user_id: userId,
                token,
                expires_at: nowJKT.add(7, 'day').toDate()

            }, { transaction });
        } catch (error) {
            throw new Error(`Store refresh token failed: ${error.message}`);
        }
    }
    async logActivity(userId, action, tableName = null, recordId = null, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
        try {
            await AuditLog.create({
                user_id: userId,
                action,
                table_name: tableName,
                record_id: recordId,
                old_values: oldValues,
                new_values: newValues,
                ip_address: ipAddress,
                user_agent: userAgent
            });
        } catch (error) {
            console.error("Log activity failed:", error.message);
        }
    }

    async cleanExpiredTokens(transaction = null) {
        try {
            return await RefreshToken.destroy({
                where: {
                    expires_at: { [Op.lt]: nowJKT.toDate() }
                },
                transaction
            });
        } catch (error) {
            console.error('Clean expired tokens failed:', error);
            return 0;
        }
    }

    async refreshToken(refreshTokenValue) {
        if (!refreshTokenValue) {
            throw new BaseError("Refresh token is required", 400, "TOKEN_MISSING");
        }

        const transaction = await sequelize.transaction();

        try {
            const decoded = verifyRefreshToken(refreshTokenValue);
            if (!decoded?.jti) throw new Error("Invalid refresh token payload");

            const tokenRecord = await RefreshToken.findOne({
                where: {
                    token: refreshTokenValue,
                    expires_at: { [Op.gt]: nowJKT.toDate() }
                },
                transaction
            });

            if (!tokenRecord) {
                throw new BaseError("Refresh token not found or expired", 401, "TOKEN_EXPIRED");
            }

            const user = await User.findOne({
                where: { id: tokenRecord.user_id, is_active: true },
                include: [{ model: Role, as: 'Role' }],
                transaction
            });

            if (!user) {
                throw new BaseError("User not found or inactive", 404, "USER_NOT_FOUND");
            }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.Role.name,
                permissions: user.Role.permissions || {}
            };

            const newTokens = generateTokenPair(payload);

            await RefreshToken.destroy({ where: { token: tokenRecord.token }, transaction });

            await this.cleanExpiredTokens(transaction);

            await this.storeRefreshToken(user.id, newTokens.refreshToken, transaction);

            await transaction.commit();

            return {
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
                accessTokenExpiresIn: newTokens.accessTokenExpiresIn,
                refreshTokenExpiresIn: newTokens.refreshTokenExpiresIn
            };
        } catch (error) {
            await transaction.rollback();
            console.error("Refresh token failed:", error);
            throw new BaseError(`Token refresh failed: ${error.message}`, 500, "REFRESH_ERROR");
        }
    }

    async logout(refreshToken, userId = null) {
        try {
            if (refreshToken) {
                await RefreshToken.destroy({ where: { token: refreshToken } });
            }

            if (userId) {
                await this.logActivity(userId, 'LOGOUT', 'users', userId);
            }

            return true;
        } catch (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    async logoutAll(userId) {
        try {
            await RefreshToken.destroy({ where: { user_id: userId } });

            await this.logActivity(userId, 'LOGOUT_ALL', 'users', userId);

            return true;
        } catch (error) {
            throw new Error(`Logout all failed: ${error.message}`);
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        const transaction = await sequelize.transaction();
        try {
            const user = await User.findByPk(userId, { transaction });

            if (!user) {
                throw new Error('User not found');
            }

            const isValid = await comparePassword(currentPassword, user.password);
            if (!isValid) {
                throw new Error('Current password is incorrect');
            }

            const hashed = await hashPassword(newPassword);

            user.password = hashed;
            await user.save({ transaction });

            await RefreshToken.destroy({ where: { user_id: userId }, transaction });

            await this.logActivity(userId, 'PASSWORD_CHANGE', 'users', userId);

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw new Error(`Password change failed: ${error.message}`);
        }
    }

    async resetPassword(userId, newPassword, adminId) {
        const transaction = await sequelize.transaction();
        try {
            const user = await User.findByPk(userId, { transaction });
            if (!user) {
                throw new Error('User not found');
            }

            const hashed = await hashPassword(newPassword);
            user.password = hashed;
            await user.save({ transaction });

            await RefreshToken.destroy({ where: { user_id: userId }, transaction });

            await this.logActivity(adminId, 'PASSWORD_RESET', 'users', userId);

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    async getUserByEmail(email) {
        try {
            const user = await User.findOne({
                attributes: { exclude: ['id', 'password', 'role_id'] },
                where: {
                    email,
                    is_active: true
                },
                include: [{ model: Role, as: 'Role' }]
            });

            return user;
        } catch (error) {
            console.error('Get user by email error:', error);
            throw new Error('Failed to get user');
        }
    }

    async getAllUsers() {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['id', 'password', 'role_id'] },
                include: [
                    {
                        model: Role,
                        as: 'Role'
                    }
                ],
                order: [['created_at', 'DESC']] // opsional
            });

            return users;
        } catch (error) {
            console.error('Get all users error:', error);
            throw new Error('Failed to get users');
        }
    }

    async register(name, email, password) {
        const transaction = await sequelize.transaction();
        try {
            const existing = await User.findOne({ where: { email }, transaction });
            if (existing) {
                throw new Error('Email already registered');
            }

            const hashed = await hashPassword(password);


            const role = await Role.findOne({ where: { name: 'employee' }, transaction });
            if (!role) {
                throw new Error('Role "employee" not found');
            }

            const newUser = await User.create({
                name,
                email,
                password: hashed,
                role_id: role.id,
                is_active: true
            }, { transaction });

            await this.logActivity(newUser.id, 'REGISTER_SUCCESS', 'users', newUser.id, null, null, null, null, transaction);

            await transaction.commit();

            return {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: role.name
            };
        } catch (error) {
            await transaction.rollback();
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    async setUserActiveStatus(userId, isActive, options = {}) {
        const { activeOnly = false } = options;

        const whereClause = activeOnly
            ? { id: userId, is_active: true }
            : { id: userId };

        const user = await User.findOne({ where: whereClause });

        if (!user) {
            throw new BaseError('User not found', 404, 'USER_NOT_FOUND');
        }

        await user.update({ is_active: isActive });

        return user;
    }


    async getLoginLogs({ userId, startDate, endDate, action = ['LOGIN', 'LOGOUT'], page = 1, limit = 20 }) {
        const where = {
            action,
        };

        if (userId) where.user_id = userId;
        if (startDate && endDate) {
            where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const logs = await AuditLog.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            total: logs.count,
            page,
            limit,
            data: logs.rows
        };
    }

    async getUserById(user_id) {
        console.log(user_id);
        try {
            const user = await User.findOne({
                where: {
                    id: user_id,
                },
                include: [{ model: Role, as: 'Role' }]
            });

            return user;
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw new Error('Failed to get user');
        }
    }

}

module.exports = new AuthService();
