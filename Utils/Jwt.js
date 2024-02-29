import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const secret = `${process.env.JWT_SECRET}` || 'secretKey'

export const generateToken = (user) => {
    return jwt.sign(
        {
            id : user._id ,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            likedPosts: user.likedPosts,
            responsedPosts: user.responsedPosts,
        },
        secret,
        { expiresIn: "24h" }
    )
}

export const verifyToken = (token) => {
    return jwt.verify(token, secret)
}