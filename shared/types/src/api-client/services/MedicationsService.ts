/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMedicationRequest } from '../models/CreateMedicationRequest';
import type { MedicationResponse } from '../models/MedicationResponse';
import type { UpdateMedicationRequest } from '../models/UpdateMedicationRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MedicationsService {

    /**
     * Get all medications with optional filtering by care recipient
     * @param careRecipientId
     * @returns MedicationResponse Ok
     * @throws ApiError
     */
    public static getMedications(
        careRecipientId?: string,
    ): CancelablePromise<Array<MedicationResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/medications',
            query: {
                'careRecipientId': careRecipientId,
            },
        });
    }

    /**
     * Create a new medication
     * @param requestBody
     * @returns MedicationResponse Ok
     * @throws ApiError
     */
    public static createMedication(
        requestBody: CreateMedicationRequest,
    ): CancelablePromise<MedicationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/medications',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }

    /**
     * Get a medication by ID
     * @param id
     * @returns MedicationResponse Ok
     * @throws ApiError
     */
    public static getMedication(
        id: string,
    ): CancelablePromise<MedicationResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/medications/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Medication not found`,
            },
        });
    }

    /**
     * Update a medication
     * @param id
     * @param requestBody
     * @returns MedicationResponse Ok
     * @throws ApiError
     */
    public static updateMedication(
        id: string,
        requestBody: UpdateMedicationRequest,
    ): CancelablePromise<MedicationResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/medications/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Medication not found`,
            },
        });
    }

    /**
     * Delete a medication
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteMedication(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/medications/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Medication not found`,
            },
        });
    }

}
