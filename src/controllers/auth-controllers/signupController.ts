import type { Request,Response } from "express"
import { signupSchema } from "../../validations/auth.validation.js"
import { errorResponse, successResponse } from "../../utils/responses.js"
import { ERROR_CODES } from "../../utils/constants.js"
import { prisma } from "../../lib/prisma.js"
import bcrypt from 'bcrypt'

export const signupController = async(req:Request,res:Response)=>{
    try {

    const validatedData = signupSchema.safeParse(req.body)

    if(!validatedData.success){
        return res.status(400).json(errorResponse(ERROR_CODES.INVALID_REQUEST))
    }
    const {email,name,password,role,phone} = validatedData.data
        const userExists = await prisma.user.findFirst({
            where:{
                email
            }
        })
        if(userExists){
            return res.status(400).json(errorResponse(ERROR_CODES.EMAIL_ALREADY_EXISTS))
        }

        const hashedPassword = await bcrypt.hash(password,8)
        
        const user =  await prisma.user.create({
            data:{
                email,
                name,
                password:hashedPassword,
                role,
                phone:phone??null

            }
        })

        return res.status(201).json(
            successResponse({
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
                phone:user.phone
            })
        )
        
    } catch (error) {
        console.error('Error in creating user\n',error)
        return res.status(500).json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR))
    }
}