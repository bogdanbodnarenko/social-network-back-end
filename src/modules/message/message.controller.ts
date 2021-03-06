import { NextFunction, Response } from 'express';
import * as _ from 'lodash';
import { In } from 'typeorm';

import { AuthReq, ChannelByIdReq, MessageByIdReq, ReqWithImageUrl } from '../shared/constants/interfaces';
import { validMessageSchema } from '../shared/validations';
import { formatYupError } from '../../utils';
import { Message } from '../../entity';
import { shortUserFields, uploadsDir } from '../shared/constants/constants';
import * as fs from 'fs';
import * as path from 'path';

export const messageById = async (
    req: AuthReq & MessageByIdReq,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const { messageId } = req.params;
    if (!+messageId) {
        return res.status(400).json({ error: 'Bad message id' });
    }
    const message = await Message.findOne({ where: { id: messageId }, relations: ['sender'] });
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    req.message = message;
    next();
};

export const getMessages = async (req: AuthReq & ChannelByIdReq, res: Response): Promise<Response> => {
    const {
        channelById,
        query: { limit, offset },
    } = req;
    const take = limit && +limit && +limit <= 200 ? +limit : 50;
    const messages = await Message.find({
        where: { channel: channelById },
        skip: offset || 0,
        take,
        relations: ['sender'],
    } as any);
    const messagesToSend = messages.map(message => ({
        ...message,
        sender: _.pick(message.sender, shortUserFields),
    }));
    return res.json(messagesToSend);
};

export const createMessage = async (
    req: AuthReq & ChannelByIdReq & ReqWithImageUrl,
    res: Response,
): Promise<Response> => {
    const { user, channelById, body, imageUrl } = req;
    try {
        await validMessageSchema.validate(body, { abortEarly: false });
    } catch (err) {
        if (imageUrl) {
            fs.unlinkSync(path.join(uploadsDir, imageUrl));
        }
        return res.status(400).json(formatYupError(err));
    }
    const bodyFields = _.pick(body, ['content']);
    if (!body.content && !imageUrl) {
        return res.status(400).json({ error: 'Content or image should be passed' });
    }
    const message = Message.create({ ...bodyFields, sender: user, channel: channelById, imageUrl });
    await message.save();
    return res.json(message);
};

export const updateMessage = async (req: AuthReq & MessageByIdReq, res: Response): Promise<Response> => {
    const { message, body } = req;
    try {
        await validMessageSchema.validate(body, { abortEarly: false });
    } catch (err) {
        return res.status(400).json(formatYupError(err));
    }
    const bodyFields = _.pick(body, ['content']);
    await Message.update({ id: message.id }, { ...bodyFields, updated: new Date() });

    return res.json({ ...message, ...bodyFields });
};

export const deleteMessages = async (req: AuthReq, res: Response): Promise<Response> => {
    const {
        user,
        body: { messageIds },
    } = req;
    if (!Array.isArray(messageIds) || !messageIds.length) {
        return res.status(400).json({ error: 'Please provide messageIds' });
    }
    const messages = await Message.find({ where: { id: In(messageIds) }, relations: ['sender'] });
    if (messages.some(message => message.sender.id !== user.id)) {
        return res.status(403).json({ error: 'You can delete only your own messages' });
    }
    await Message.remove(messages);
    return res.json({ message: 'Success' });
};
