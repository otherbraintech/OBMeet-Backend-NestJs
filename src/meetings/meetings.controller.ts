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
  @Post(':id/delete') // Usamos POST para mayor compatibilidad o DELETE directamente
  remove(@Request() req, @Param('id') id: string) {
    return this.meetingsService.softDelete(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/participants')
  async addParticipant(@Param('id') id: string, @Body() body: { name: string; role?: string; voiceSampleUrl?: string }) {
    return this.meetingsService.addParticipant(id, body);
  }

  // Endopoint para el Webhook (Sin Auth JWT o con una Key secreta)
  @Post('webhook-result/:id')
  async webhookResult(@Param('id') id: string, @Body() body: any) {
    console.log(`Recibiendo resultados para reunión ${id}`);
    return this.meetingsService.updateAiResults(id, {
      aiAnalysis: body.aiAnalysis,
      metrics: body.participants, // Guardamos las métricas de participación aquí
      transcript: body.transcript,
      durationSeconds: body.durationSeconds,
    });
  }
}
