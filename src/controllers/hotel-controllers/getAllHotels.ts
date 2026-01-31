import type {Request,Response} from 'express'
import { prisma } from '../../lib/prisma.js'
import { errorResponse, successResponse } from '../../utils/responses.js'
import type { Prisma } from '../../generated/prisma/client.js'
import { ERROR_CODES } from '../../utils/constants.js'
export const getAllHotels = async(req:Request,res:Response)=>{
    try {
        const {city, country, minPrice, maxPrice, minRating} = req.query

        const hotelWhereClause : Prisma.HotelWhereInput = {}

        if(city){
            hotelWhereClause.city = {
                equals:city as string,
                mode:'insensitive'
            }
        }
        if(country){
            hotelWhereClause.country = {
                equals:country as string,
                mode:'insensitive'
            }
        }
        if(minRating){
            hotelWhereClause.rating = {
                gte:parseFloat(minRating as string)
            }
        }

        const roomPriceFilter : Prisma.RoomWhereInput = {}

        if(minPrice){
            roomPriceFilter.pricePerNight ={
                gte:parseFloat(minPrice as string)
            }
        }
        if(maxPrice){
            roomPriceFilter.pricePerNight = {
                lte:parseFloat(maxPrice as string)
            }
        }

        if(minPrice || maxPrice){
            hotelWhereClause.rooms = {
                some:roomPriceFilter
            }
        }
        
        const hotels = await prisma.hotel.findMany({
            where:hotelWhereClause,
            select:{
                id:true,
                name:true,
                description:true,
                city:true,
                country:true,
                amenities:true,
                rating:true,
                totalReviews:true,
                rooms:{
                    select:{
                        pricePerNight:true
                    }
                }
            }
        })

        const hotelsWithRooms = hotels.filter((hotel)=>{
            return hotel.rooms.length > 0
        })

        const transformedHotels = hotelsWithRooms.map(hotel=>{
            const roomPrices = hotel.rooms.map(room=>{
                return Number(room.pricePerNight)
            })

            const minPricePerNight = Math.min(...roomPrices)

            const {rooms, ...hotelData} = hotel

            return {
                ...hotelData,
                minPricePerNight
            }

        })

        return res.status(200).json(successResponse({
            transformedHotels
        }))
        

        
    } catch (error) {
        console.error("Error in getAllHotels\n")
        return res.status(500).json(errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR))
    }
}