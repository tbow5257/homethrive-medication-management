/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DashboardStats } from '../models/DashboardStats';
import type { DoseResponse } from '../models/DoseResponse';
import type { UpdateDoseStatusRequest } from '../models/UpdateDoseStatusRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DosesService {

    /**
     * Get all doses with optional filtering
     * @param recipientId
     * @param status
     * @param startDate
     * @param endDate
     * @returns DoseResponse Ok
     * @throws ApiError
     */
    public static getDoses(
        recipientId?: string,
        status?: string,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<DoseResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/doses',
            query: {
                'recipientId': recipientId,
                'status': status,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }

    /**
     * Get a dose by ID
     * @param id
     * @returns DoseResponse Ok
     * @throws ApiError
     */
    public static getDose(
        id: string,
    ): CancelablePromise<DoseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/doses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Dose not found`,
            },
        });
    }

    /**
     * Update a dose status
     * @param id
     * @param requestBody
     * @returns DoseResponse Ok
     * @throws ApiError
     */
    public static updateDoseStatus(
        id: string,
        requestBody: UpdateDoseStatusRequest,
    ): CancelablePromise<DoseResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/doses/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Dose not found`,
            },
        });
    }

    /**
     * Get upcoming doses
     * @param limit
     * @returns DoseResponse Ok
     * @throws ApiError
     */
    public static getUpcomingDoses(
        limit: number = 5,
    ): CancelablePromise<Array<DoseResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/doses/upcoming',
            query: {
                'limit': limit,
            },
        });
    }

    /**
     * Get dashboard statistics
     * @returns DashboardStats Ok
     * @throws ApiError
     */
    public static getDashboardStats(): CancelablePromise<DashboardStats> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/doses/dashboard/stats',
        });
    }

}
