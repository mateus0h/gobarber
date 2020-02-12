import { parseISO, startOfHour, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import Appointment from '../models/Appointment';

import Notification from '../schemas/Notification';

class CreateAppointmentService {
  async run({ userId, provider_id, date }) {
    // Check userId != provider_id

    if (userId === provider_id) {
      throw new Error("you can't make an appointment for yoursel");
    }
    // Check if provider_id is a provider

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      throw new Error('You can only create appointment with providers');
    }
    // Check for past dates

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error('Past dates are not permitted');
    }
    // Check date availability

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      throw new Error('Appointment date is not availability');
    }

    const appointment = await Appointment.create({
      user_id: userId,
      provider_id,
      date: hourStart,
    });
    // Notify appointment provider

    const user = await User.findByPk(userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      {
        locale: pt,
      }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return appointment;
  }
}

export default new CreateAppointmentService();
