import { isBefore, subHours } from 'date-fns';

import User from '../models/User';
import Appointment from '../models/Appointment';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class CancelAppointmentService {
  async run({ provider_id, user_id }) {
    const appointment = await Appointment.findByPk(provider_id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== user_id) {
      throw new Error("You don't have permission to cancel this appointment.");
    }
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      throw new Error('You can only cancel appointments 2 hours in advance');
    }
    // Check this appointment has canceled.

    if (appointment.canceled_at !== null) {
      throw new Error('This appointment has already been canceled');
    }
    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return appointment;
  }
}

export default new CancelAppointmentService();
