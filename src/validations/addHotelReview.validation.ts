import z from "zod";

const addHotelReviewSchema = z
  .object({
    bookingId: z.uuid(),
    rating: z.number().positive(),
    comment: z.string().trim().nonempty(),
  })
  .strict();

export { addHotelReviewSchema };
