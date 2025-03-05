/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDoseRequest } from '../models/CreateDoseRequest';
import type { FlattenedDoseResponse } from '../models/FlattenedDoseResponse';
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
     * @returns FlattenedDoseResponse Ok
     * @throws ApiError
     */
    public static getDoses(
        recipientId?: string,
        status?: string,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<FlattenedDoseResponse>> {
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
     * Create a new dose record
     * @param requestBody
     * @returns FlattenedDoseResponse Ok
     * @throws ApiError
     */
    public static createDose(
        requestBody: CreateDoseRequest,
    ): CancelablePromise<FlattenedDoseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/doses',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Medication not found`,
            },
        });
    }

    /**
     * Get a dose by ID
     * @param id
     * @returns FlattenedDoseResponse Ok
     * @throws ApiError
     */
    public static getDose(
        id: string,
    ): CancelablePromise<FlattenedDoseResponse> {
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
     * @returns FlattenedDoseResponse Ok
     * @throws ApiError
     */
    public static updateDoseStatus(
        id: string,
        requestBody: UpdateDoseStatusRequest,
    ): CancelablePromise<FlattenedDoseResponse> {
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

}
