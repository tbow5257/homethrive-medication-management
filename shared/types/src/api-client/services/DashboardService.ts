/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DashboardStats } from '../models/DashboardStats';
import type { UpcomingMedication } from '../models/UpcomingMedication';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DashboardService {

    /**
     * Get upcoming medications for next 7 days based on schedules
     * @param limit
     * @returns UpcomingMedication Ok
     * @throws ApiError
     */
    public static getUpcomingDoses(
        limit: number = 5,
    ): CancelablePromise<Array<UpcomingMedication>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/upcoming',
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
            url: '/dashboard/stats',
        });
    }

}
