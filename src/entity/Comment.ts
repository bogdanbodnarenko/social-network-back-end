import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

/**
 * @swagger
 *  components:
 *    schemas:
 *      Comment:
 *        type: object
 *        required:
 *          - content
 *        properties:
 *          id:
 *            type: integer
 *          content:
 *            type: string
 *            description: The content of the comment.
 *          created:
 *              type: string
 *              format: date-time
 *          imageUrl:
 *              type: string
 *              format: url
 *          updated:
 *              type: string
 *              format: date-time
 *          post:
 *              type: object
 *              $ref: '#/components/schemas/Post'
 *          sender:
 *              type: object
 *              $ref: '#/components/schemas/User'
 */
@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ default: new Date() })
    created: Date;

    @Column({ type: 'date', nullable: true })
    updated: Date;

    @Column({ type: 'varchar', length: 200, nullable: true })
    imageUrl: string;

    @ManyToOne(
        () => Post,
        post => post.comments,
    )
    post: Post;

    @ManyToOne(
        () => User,
        user => user.comments,
    )
    sender: User;
}
