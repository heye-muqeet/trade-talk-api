import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarService {
    private oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    constructor() {}

    async createEvent(accessToken: string, eventDetails: any) {
        try {
            console.log("Access Token:", accessToken);
            console.log("Event Details:", eventDetails);

            if (!eventDetails) {
                throw new Error("eventDetails is undefined");
            }

            this.oauth2Client.setCredentials({ access_token: accessToken });

            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

            const event = {
                summary: eventDetails.summary || "No title",
                description: eventDetails.description || "",
                start: {
                    dateTime: eventDetails.startTime,
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: eventDetails.endTime,
                    timeZone: 'America/New_York',
                },
                attendees: eventDetails.attendees || [],
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });

            console.log("Event Created:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error creating event:", error.message);
            throw new Error(error.message);
        }
    }

    async updateEvent(accessToken: string, eventId: string, eventDetails: any) {
        try {
            console.log("Updating Event - Access Token:", accessToken);
            console.log("Updating Event - Event ID:", eventId);
            console.log("Updating Event - Event Details:", eventDetails);

            if (!eventDetails || !eventId) {
                throw new Error("eventDetails or eventId is undefined");
            }

            this.oauth2Client.setCredentials({ access_token: accessToken });

            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

            // First get the existing event to preserve any fields not being updated
            const existingEvent = await calendar.events.get({
                calendarId: 'primary',
                eventId: eventId
            });

            const event = {
                ...existingEvent.data,
                summary: eventDetails.summary || existingEvent.data.summary,
                description: eventDetails.description || existingEvent.data.description,
                start: {
                    dateTime: eventDetails.startTime || existingEvent.data.start?.dateTime,
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: eventDetails.endTime || existingEvent.data.end?.dateTime,
                    timeZone: 'America/New_York',
                },
                attendees: eventDetails.attendees || existingEvent.data.attendees || [],
            };

            const response = await calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: event,
            });

            console.log("Event Updated:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating event:", error.message);
            throw new Error(error.message);
        }
    }

    async getEvent(accessToken: string, eventId: string) {
        try {
            this.oauth2Client.setCredentials({ access_token: accessToken });
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            
            const response = await calendar.events.get({
                calendarId: 'primary',
                eventId: eventId
            });
            
            return response.data;
        } catch (error) {
            console.error("Error fetching event:", error.message);
            throw new Error(error.message);
        }
    }

    async getAllEvents(accessToken: string) {
        try {
            this.oauth2Client.setCredentials({ access_token: accessToken });
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

            const response = await calendar.events.list({
                calendarId: 'primary',
                singleEvents: true, // Expands recurring events into individual instances
                orderBy: 'startTime', // Sort by start time
            });

            console.log("All events fetched:", response.data.items);
            return response.data.items || []; // Return the list of events, or empty array if none
        } catch (error) {
            console.error("Error fetching all events:", error.message);
            throw new Error(error.message);
        }
    }

    async getEventsByTime(accessToken: string, startTime: Date) {
        try {
            console.log(accessToken);
            this.oauth2Client.setCredentials({ access_token: accessToken });
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: startTime.toISOString(), // Fetch events starting at or after this time
                singleEvents: true, // Expands recurring events into individual instances
                orderBy: 'startTime', // Sort by start time
            });


            console.log("Events fetched by time:", response.data.items);
            return response.data.items || []; // Return the list of events, or empty array if none
        } catch (error) {
            console.error("Error fetching events by time:", error.message);
            throw new Error(error.message);
        }
    }
}