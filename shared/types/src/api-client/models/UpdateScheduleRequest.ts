/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DayOfWeek } from './DayOfWeek';

export type UpdateScheduleRequest = {
    times?: Array<string>;
    daysOfWeek?: Array<DayOfWeek>;
    isActive?: boolean;
    medicationId?: string;
};

