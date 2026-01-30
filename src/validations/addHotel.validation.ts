import z from 'zod'

export const addHotelSchema = z.object({
    name: z.string(),
    description:z.string(),
    city:z.string(),
    country:z.string(),
    amenities:z.array(z.string())
})
.strict()