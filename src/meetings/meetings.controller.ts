import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() body: { title: string; description?: string }) {
    return this.meetingsService.create(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.meetingsService.findAll(req.user.userId);
  }

  /**
   * Obtiene todos los participantes registrados del usuario logueado
   */
  @UseGuards(JwtAuthGuard)
  @Get('participants/all')
  findAllParticipants(@Request() req) {
    return this.meetingsService.getMyParticipants(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.meetingsService.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.meetingsService.update(id, req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/delete')
  remove(@Request() req, @Param('id') id: string) {
    return this.meetingsService.softDelete(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/participants')
  async addParticipant(
    @Request() req,
    @Param('id') id: string, 
    @Body() body: { participantId?: string; name?: string; voiceSampleUrl?: string }
  ) {
    return this.meetingsService.addParticipant(id, req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/participants/:participantId/delete')
  async removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string
  ) {
    return this.meetingsService.removeParticipant(id, participantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/process')
  async processAudio(@Request() req, @Param('id') id: string) {
    return this.meetingsService.processAudio(id, req.user.userId);
  }

  // Endpoint para el Webhook
  @Post('webhook-result/:id')
  async webhookResult(@Param('id') id: string, @Body() body: any) {
    console.log(`Recibiendo resultados para reunión ${id}`);
    return this.meetingsService.updateAiResults(id, {
      aiAnalysis: body.aiAnalysis,
      metrics: body.participants,
      transcript: body.transcript,
      durationSeconds: body.durationSeconds,
    });
  }
}
