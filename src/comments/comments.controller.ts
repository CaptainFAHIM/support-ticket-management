// Fahim
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

/**
 * CommentsController
 *
 * Nested under tickets for creation and listing.
 * Flat routes for update/delete since comment ID is unique.
 *
 *   POST   /tickets/:ticketId/comments  → add a comment
 *   GET    /tickets/:ticketId/comments  → list comments for a ticket
 *   PATCH  /comments/:id               → edit a comment (author or Admin)
 *   DELETE /comments/:id               → delete a comment (author or Admin)
 *
 * Note: author/Admin permission is enforced inside CommentsService
 * (updateComment / deleteComment), not via @Roles(), since it depends
 * on comment ownership rather than a fixed role.
 */
@ApiTags('Comments')
@ApiBearerAuth()
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Add a comment to a ticket (all authenticated users)' })
  @ApiBody({ type: CreateCommentDto })
  @Post('tickets/:ticketId/comments')
  async create(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return await this.commentsService.createComment(ticketId, user.sub, dto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message || 'Could not create comment' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'List all comments for a ticket (all authenticated users)' })
  @Get('tickets/:ticketId/comments')
  async findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    try {
      return await this.commentsService.findByTicket(ticketId);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Could not fetch comments' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update a comment (author or Admin only)' })
  @ApiBody({ type: UpdateCommentDto })
  @Patch('comments/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return await this.commentsService.updateComment(id, user.sub, user.role, dto);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not update comment',
        },
        error.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Delete a comment (author or Admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('comments/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.commentsService.deleteComment(id, user.sub, user.role);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.BAD_REQUEST,
          error: error.message || 'Could not delete comment',
        },
        error.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }
}