import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Min 6 characters"),
  full_name: z.string().min(2, "Name required"),
});

export const createCommunitySchema = z.object({
  name: z.string().trim().min(1, "Community name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  category_id: z.coerce.number().min(1, "Category is required"),
  experience_level: z.enum(["less_than_1_year", "1_to_3_years", "3_plus_years"], {
    required_error: "Experience level is required",
  }),
  specialization: z.string().optional(),
  portfolio_links: z.array(z.string().url("Enter a valid URL")).optional(),
  admin_bio: z.string().optional(),
  contact_phone: z.string().optional(),
  terms_accepted: z.boolean().refine((value) => value === true, {
    message: "You must confirm the information is accurate",
  }),
});

export const editCommunitySchema = z.object({
  name: z.string().trim().min(1, "Community name is required"),
  description: z.string().optional(),
  location: z.string().trim().min(1, "Location is required"),
});

export const createJobSchema = z.object({
  category_id: z.coerce.number().min(1, "Category required"),
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
  deadline: z.string().min(1),
  final_price: z.coerce.number().positive(),
});

export const jobBidSchema = z.object({
  proposed_cost: z.coerce.number().positive("Bid amount must be greater than 0"),
  proposed_days: z.coerce.number().int().positive("Timeline must be at least 1 day"),
  note: z.string().optional(),
});

export const openCallSchema = z.object({
  community_id: z.coerce.number(),
  title: z.string().min(3),
  skill_ids: z.array(z.coerce.number()).optional(),
});

export const reviewSchema = z.object({
  community_id: z.coerce.number(),
  member_id: z.coerce.number().optional(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional(),
});

export const deliverableSchema = z.object({
  deliverable_url: z.string().url("Valid URL required"),
});

export const categorySchema = z.object({
  name: z.string().min(2),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type CreateCommunityForm = z.infer<typeof createCommunitySchema>;
export type EditCommunityForm = z.infer<typeof editCommunitySchema>;
export type CreateJobForm = z.infer<typeof createJobSchema>;
export type JobBidForm = z.infer<typeof jobBidSchema>;
export type OpenCallForm = z.infer<typeof openCallSchema>;
export type ReviewForm = z.infer<typeof reviewSchema>;
