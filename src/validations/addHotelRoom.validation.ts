import z from "zod";

const addHotelRoomParamsSchema = z.object({
  hotelId: z.string().trim(),
});

const addHotelRoomSchema = z
  .object({
    roomNumber: z.string().trim().nonempty(),
    roomType: z.string().trim().nonempty(),
    pricePerNight: z.number().positive(),
    maxOccupancy: z.number().int().min(1),
  })
  .strict();

export { addHotelRoomSchema, addHotelRoomParamsSchema };
