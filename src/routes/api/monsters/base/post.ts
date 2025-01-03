import { Router } from 'express';
import { Prisma } from '@prisma/client';
import upload from '../../../../utils/storage';
import { UpdatedMonsterData } from './monsters.interface';

module.exports = Router({ mergeParams: true }).post('/monsters/base', upload.single('avatarFile'), async (req: any, res: any) => {
  try {
    const newData: UpdatedMonsterData = {
      name: JSON.parse(req.body.name),
      published: JSON.parse(req.body.published),
      hp_multiplier: JSON.parse(req.body.hp_multiplier),
      hp_style: JSON.parse(req.body.hp_style),
      trigger_words: Array.isArray(JSON.parse(req.body.trigger_words)) && JSON.parse(req.body.trigger_words).length > 0 ? JSON.parse(req.body.trigger_words).join(',') : '',
      bar_theme: JSON.parse(req.body.bar_theme).toLowerCase(),
    }

    if (JSON.parse(req.body.isAvatarChanged)) {
      newData['avatar_url'] = req?.file?.filename || undefined;
    }

    const monster = await req.db.monster.create({
      data: newData,
    });
  
    if (monster && monster?.id > 0) {

      // **************************** MOVE TO CLIENT ****************************
      // if (JSON.parse(req.body.published) === true) {
      //   // update Twitch service watched monster list in case of publish status change
      //   req['TwitchEmitter'].emit('publish', {
      //     id: monster.id,
      //     status: JSON.parse(req.body.published),
      //   });
      // }

      return res.status(200).json({
        success: true,
        data: [monster],
      });
    } else {
      throw new Error('Could not create monster');
    }
  } catch (e: any) {
    let msg = e;
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === 'P2002') {
        let target = e?.meta?.['target'];
        msg = 'Monster with the same ' + (Array.isArray(target) ? target[0] : '') +  ' already exists';
      }
    }
    return res.status(500).json({
      success: false,
      msg: msg,
    });
  }
});