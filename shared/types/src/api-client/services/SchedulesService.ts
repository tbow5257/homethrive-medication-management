/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateScheduleRequest } from '../models/CreateScheduleRequest';
import type { FlattenedScheduleResponse } from '../models/FlattenedScheduleResponse';
import type { UpdateScheduleRequest } from '../models/UpdateScheduleRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SchedulesService {

    /**
     * Get all schedules with optional filtering by medication
     * @param medicationId
     * @returns FlattenedScheduleResponse Ok
     * @throws ApiError
     */
    public static getSchedules(
        medicationId?: string,
    ): CancelablePromise<Array<FlattenedScheduleResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules',
            query: {
                'medicationId': medicationId,
            },
        });
    }

    /**
     * Create a new schedule
     * @param requestBody
     * @returns FlattenedScheduleResponse Ok
     * @throws ApiError
     */
    public static createSchedule(
        requestBody: CreateScheduleRequest,
    ): CancelablePromise<FlattenedScheduleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedules',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }

    /**
     * Get a schedule by ID
     * @param id
     * @returns FlattenedScheduleResponse Ok
     * @throws ApiError
     */
    public static getSchedule(
        id: string,
    ): CancelablePromise<FlattenedScheduleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Schedule not found`,
            },
        });
    }

    /**
     * Update a schedule
     * @param id
     * @param requestBody
     * @returns FlattenedScheduleResponse Ok
     * @throws ApiError
     */
    public static updateSchedule(
        id: string,
        requestBody: UpdateScheduleRequest,
    ): CancelablePromise<FlattenedScheduleResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/schedules/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Schedule not found`,
            },
        });
    }

    /**
     * Delete a schedule (mark as inactive)
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteSchedule(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/schedules/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Schedule not found`,
            },
        });
    }

}
