interface CreateUserDto {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  password?: string;
  phone_number?: string;
  profile_picture?: string;
  provider: "github" | "email" | " google";
}

interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string;
}

interface UpdateAccountTypeDto {
  userId: string;
  accountType: "free" | "premium";
}

interface CreateAuthDto {
  email: string;
  password: string;
  userType: "user" | "admin";
}

interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  };
}

interface CreateAdminDto {
  first_name: string;
  last_name: string;
  password: string;
  email: string;
  role: "support" | "quotation" | "system";
}

interface UpdateAdminDto {
  first_name?: string;
  last_name?: string;
  password?: string;
  email?: string;
  role?: "support" | "quotation" | "system";
}

interface CreateTicketDto {
  issue: string;
}

interface UpdateTicketDto {
  issue?: string;
}

interface TicketStatusDto {
  ticket_status: "open" | "in-progress" | "closed";
}

interface TicketPriorityDto {
  priority_level: "low" | "medium" | "high";
}

interface AssignAdminDto {
  admin_id: string;
}

interface CreateQuote {
  quote_id: string;
  quote_details: string;
  estimated_cost?: number;
  valid_until?: string;
  quote_type?: string;
  attachments?: string[];
}

interface UpdateQuote {
  quote_details?: string;
  estimated_cost?: number;
  valid_until?: string;
  quote_type?: string;
  attachments?: string[];
}

interface UpdateQuoteStatusDto {
  status: "pending" | "approved" | "rejected" | "expired";
}

interface Profile {}

interface UpdateProfileDto {}

interface CreateProfileDto {}

interface ResetPasswordDto {}

interface RequestResetPasswordDto {}

interface UpdateEmailDto {}

interface UpdateUserStatusDto {}

interface ActivateOtpDto {
  email: string;
  code?: string;
  token?: string;
}

interface Quote {
  quote_id: string;
  user_id: string;
  quote_details: string;
  status: "pending" | "approved" | "rejected" | "expired";
  requested_date: Date;
  estimated_cost?: number;
  valid_until?: Date;
  updated_at: Date;
  created_at: Date;
  quote_type?: string;
  attachments?: string[];
}
type UserAccountStatus = "pending" | "active" | "inactive";
type UserAccountType = "free" | "premium";

interface UserWithCounts {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: UserAccountStatus;
  account_type: UserAccountType;
  quotation_count: number;
  tickets_count: number;
  visits_count: number;
  quotes_count: number;
  email_verified: boolean;
  phone_number: string;
  registration_date: string;
  last_login: string | null;
  profile_picture?: string;
}

interface AdminActivityLog {
  log_id: string;
  action_type: string;
  action_details: string | null;
  action_time: string;
  ip_address: string;
  target_entity: string | null;
  target_id: number | null;
  admin?: {
    admin_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}
