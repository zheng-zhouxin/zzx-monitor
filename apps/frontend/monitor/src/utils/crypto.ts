import bcrypt from 'bcryptjs'

// 用固定 salt，避免每次哈希耗时差异
const saltRounds = '$2a$10$j08v6qUb20lAUMyyG2d0TO' // 推荐盐的复杂度设置为 10

/** 加密密码 */
export const encrypt = async (password: string) => bcrypt.hash(password, saltRounds)

/** 比对密码 */
export const encryptCompare = async (password: string, hash: string) => bcrypt.compare(password, hash)
