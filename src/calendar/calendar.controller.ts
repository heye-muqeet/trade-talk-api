import { Controller, Post, Body, Headers, Param, Get, Put, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) {}

    @Post('create-event')
    async createEvent(@Body() body: any, @Headers('authorization') authHeader: string) {
        console.log("Received Body:", body);

        if (!authHeader) {
            return { error: "Authorization header is missing" };
        }

        const accessToken = authHeader.replace("Bearer ", "").trim();
        if (!accessToken) {
            return { error: "Invalid token format" };
        }

        if (!body.summary) {
            return { error: "Invalid request: Missing required fields" };
        }

        return this.calendarService.createEvent(accessToken, body);
    }

    @Get('event/:eventId')
    async getEvent(
        @Param('eventId') eventId: string,
        @Headers('authorization') authHeader: string,
        @Query('time') time?: string, // Optional query parameter for time
    ) {
        if (!authHeader) {
            return { error: "Authorization header is missing" };
        }

        const accessToken = authHeader.replace("Bearer ", "").trim();
        if (!accessToken) {
            return { error: "Invalid token format" };
        }

        // If a time is provided, fetch events based on the time instead of just eventId
        if (time) {
            try {
                const parsedTime = new Date(time);
                if (isNaN(parsedTime.getTime())) {
                    return { error: "Invalid time format. Please provide a valid ISO date string (e.g., '2025-03-29T14:30:00Z')" };
                }
                return this.calendarService.getEventsByTime(accessToken, parsedTime);
            } catch (error) {
                return { error: "Error parsing time: " + error.message };
            }
        }

        // If no time is provided, fetch the event by eventId as before
        return this.calendarService.getEvent(accessToken, eventId);
    }

    @Put('update-event/:eventId')
    async updateEvent(
        @Param('eventId') eventId: string,
        @Body() body: any,
        @Headers('authorization') authHeader: string,
    ) {
        console.log("Updating Event - Received Body:", body);
        console.log("Updating Event - Event ID:", eventId);

        if (!authHeader) {
            return { error: "Authorization header is missing" };
        }

        const accessToken = authHeader.replace("Bearer ", "").trim();
        if (!accessToken) {
            return { error: "Invalid token format" };
        }

        if (!body.summary) {
            return { error: "Invalid request: Missing required fields" };
        }

        return this.calendarService.updateEvent(accessToken, eventId, body);
    }

    @Get('all-events')
    async getAllEvents(@Headers('authorization') authHeader: string) {
        if (!authHeader) {
            return { error: "Authorization header is missing" };
        }

        const accessToken = authHeader.replace("Bearer ", "").trim();
        if (!accessToken) {
            return { error: "Invalid token format" };
        }

        try {
            return this.calendarService.getAllEvents(accessToken);
        } catch (error) {
            console.error("Error in controller while fetching all events:", error.message);
            return { error: "Failed to fetch all events: " + error.message };
        }
    }
}