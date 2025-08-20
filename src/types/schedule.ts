export namespace ScheduleTypes {
  export interface EventForm {
    title: string;
    doctor: string;
    location: string;
    type: "available" | "temporary" | "unavailable";
    insurance: string;
    startTime: string;
    endTime: string;
    quota: string;
    backupQuota: string;
    repeatDays: number[];
    reason: string;
    startDate: any;
    endDate: any;
  }

  export interface RecurringEvent {
    id: string;
    title: string;
    rrule?: any;
    start?: string | Date;
    end?: string | Date;
    backgroundColor?: string;
    extendedProps: any;
    allDay?: boolean;
  }
}
