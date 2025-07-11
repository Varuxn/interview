// utils/fetchUserSettings.ts (or integrate directly into your component)

import { RowData, PositionRequest, InterviewerRequest, QueryResponse } from './types'; // Adjust path to your types.ts

/**
 * Fetches user's settings (positionId, interviewerId) and then
 * retrieves detailed information for the selected position and interviewer.
 *
 * @param userId The ID of the user to fetch settings for.
 * @returns An object containing selected position and interviewer details, or null if not found.
 */
export async function fetchUserSettingsAndDetails(userId: string): Promise<{
  selected: PositionRequest | null;
  selectedInterviewer: InterviewerRequest | null;
} | null> {
  if (!userId) {
    console.error("User ID is required to fetch settings.");
    return null;
  }

  try {
    // 1. Fetch position_id and interviewer_id from the 'settings' table for the given userId
    const settingsResponse = await fetch(`/api/databases/query?table=settings&id=${userId}`);
    if (!settingsResponse.ok) {
      console.error(`Failed to fetch settings for user ${userId}: ${settingsResponse.statusText}`);
      return null;
    }

    // console.log('Settings 响应为:', settingsResponse);

    const settingsData: QueryResponse<RowData | null> = await settingsResponse.json();

    if (!settingsData.success || !settingsData.data) {
      console.warn(`Settings not found for user ${userId}.`);
      return null;
    }

    console.log('Settings 数据:',settingsData.data)

    const userSettings = settingsData.data;
    const positionId = userSettings.position; // Assuming column name is position_id
    const interviewerId = userSettings.interviewer; // Assuming column name is interviewer_id

    let selectedPosition: PositionRequest | null = null;
    let selectedInterviewer: InterviewerRequest | null = null;

    // 2. Fetch detailed position information if positionId exists
    if (positionId) {
      const positionResponse = await fetch(`/api/databases/query?table=positions&id=${positionId}`);
      if (!positionResponse.ok) {
        console.error(`Failed to fetch position details for ID ${positionId}: ${positionResponse.statusText}`);
      } else {
        const positionData: QueryResponse<RowData | null> = await positionResponse.json();
        if (positionData.success && positionData.data) {
          // Type assertion to PositionRequest, assuming RowData can be cast
          selectedPosition = positionData.data as PositionRequest;
        } else {
          console.warn(`Position details not found for ID ${positionId}.`);
        }
      }
    }

    // 3. Fetch detailed interviewer information if interviewerId exists
    if (interviewerId) {
      const interviewerResponse = await fetch(`/api/databases/query?table=interviewers&id=${interviewerId}`);
      if (!interviewerResponse.ok) {
        console.error(`Failed to fetch interviewer details for ID ${interviewerId}: ${interviewerResponse.statusText}`);
      } else {
        const interviewerData: QueryResponse<RowData | null> = await interviewerResponse.json();
        if (interviewerData.success && interviewerData.data) {
          // Type assertion to InterviewerRequest, assuming RowData can be cast
          selectedInterviewer = interviewerData.data as InterviewerRequest;
        } else {
          console.warn(`Interviewer details not found for ID ${interviewerId}.`);
        }
      }
    }

    return {
      selected: selectedPosition,
      selectedInterviewer: selectedInterviewer,
    };

  } catch (error) {
    console.error('Error fetching user settings and details:', error);
    return null;
  }
}