// Fahim
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  /**
   * Add a comment to a ticket.
   * Any authenticated user may comment.
   */
  async createComment(
    ticketId: number,
    authorId: number,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      content: dto.content,
      ticket: { id: ticketId } as any,
      author: { id: authorId } as any,
    });
    return await this.commentsRepository.save(comment);
  }

  /**
   * Return all comments for a given ticket, ordered oldest-first.
   */
  async findByTicket(ticketId: number): Promise<Comment[]> {
    return await this.commentsRepository.find({
      where: { ticket: { id: ticketId } },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Update a comment's content.
   * Only the original author or an Admin may edit.
   * Throws NotFoundException if comment does not exist.
   * Throws ForbiddenException if the requester is neither the author nor Admin.
   */
  async updateComment(
    id: number,
    requesterId: number,
    requesterRole: Role,
    dto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found.`);
    }

    const isAuthor = comment.author.id === requesterId;
    const isAdmin = requesterRole === Role.Admin;
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You do not have permission to edit this comment.');
    }

    comment.content = dto.content;
    return await this.commentsRepository.save(comment);
  }

  /**
   * Delete a comment.
   * Only the original author or an Admin may delete.
   * Throws NotFoundException if comment does not exist.
   * Throws ForbiddenException if the requester is neither the author nor Admin.
   */
  async deleteComment(
    id: number,
    requesterId: number,
    requesterRole: Role,
  ): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found.`);
    }

    const isAuthor = comment.author.id === requesterId;
    const isAdmin = requesterRole === Role.Admin;
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this comment.');
    }

    await this.commentsRepository.remove(comment);
  }
}
