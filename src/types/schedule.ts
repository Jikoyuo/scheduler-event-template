export namespace ScheduleTypes {
  export interface EventForm {
    title: string;
    doctor: string;
    location: string;
    type: string;
    insurance: string;
    startTime: string;
    endTime: string;
    quota: string;
    backupQuota: string;
    repeatDays: number[]; // 0 = Monday
  }

  export interface RecurringEvent {
    id: string;
    title: string;
    rrule: any;
    extendedProps: any;
  }
}
