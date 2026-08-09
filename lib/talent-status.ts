export const TALENT_STATUSES = [
  "need_to_message",
  "messaged",
  "admin_panel_setup",
  "approved_in_app",
  "not_interested",
] as const;

export type TalentStatus = (typeof TALENT_STATUSES)[number];

export const TALENT_STATUS_LABELS: Record<TalentStatus, string> = {
  need_to_message: "Need to message",
  messaged: "Messaged",
  admin_panel_setup: "Set up admin panel",
  approved_in_app: "Approved in-app",
  not_interested: "Not interested / No reply",
};

export const TALENT_STATUS_BADGE_VARIANT: Record<
  TalentStatus,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  need_to_message: "outline",
  messaged: "warning",
  admin_panel_setup: "secondary",
  approved_in_app: "success",
  not_interested: "destructive",
};
