import { Router } from 'express';
import { Prisma } from '@prisma/client';
import upload from '../../../../utils/storage';

interface NewStage {
  hp_value: number,
  ref_id: number,
  avatar_url?: string,
  pause_init: boolean,
}

module.exports = Router({ mergeParams: true }).post('/monsters/stages', upload.single('avatarFile'), async (req: any, res: any) => {
  try {
    console.log(req.body.pause_init); 

    const isNotUnique = await req.db.stages.findFirst({
      where: {
        hp_value: JSON.parse(req.body.hp_value),
        ref_id: JSON.parse(req.body.ref_id),
        pause_init: JSON.parse(req.body.pause_init) === true,
      },
    });

    if (isNotUnique) {
      throw new Error('Stage for this monster at the same HP value exists');
    } else {
      const newData: NewStage = {
        hp_value: JSON.parse(req.body.hp_value),
        ref_id: JSON.parse(req.body.ref_id),
        pause_init: JSON.parse(req.body.pause_init) === true,
      }
  
      if (JSON.parse(req.body.isAvatarChanged)) {
        newData['avatar_url'] = req?.file?.filename || undefined;
      }
  
      const stage = await req.db.stages.create({
        data: newData,
      });
    
      if (stage && stage?.id > 0) {
        return res.status(200).json({
          success: true,
          data: [stage],
        });
      } else {
        throw new Error('Could not create stage');
      }
    }

  } catch (e: any) {
    console.log(e);
    let msg = e;
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === 'P2002') {
        let target = e?.meta?.['target'];
        msg = new Error('Stage with the same ' + (Array.isArray(target) ? target[0] : '') +  ' already exists');
      }
    }
    return res.status(500).json({
      success: false,
      msg: msg.message,
    });
  }
});