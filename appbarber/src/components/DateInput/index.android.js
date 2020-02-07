import React, { useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { pt } from 'date-fns/esm/locale';

import Icon from 'react-native-vector-icons/MaterialIcons';

import { Container, DateButton, DateText } from './styles';

export default function DateInput({ date, onChange }) {
  const [datePicker, setDatePicker] = useState({
    date,
    show: false,
  });

  const dateFormatted = useMemo(
    () => format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt }),
    [date]
  );

  function handleOpenPicker() {
    setDatePicker({
      show: true,
    });
  }

  function setDate(e, dateSelected) {
    if (dateSelected) {
      setDatePicker({
        date: dateSelected,
        show: false,
      });
      onChange(dateSelected);
    }
  }

  return (
    <Container>
      <DateButton onPress={handleOpenPicker}>
        <Icon name="event" color="#FFF" size={20} />
        <DateText>{dateFormatted}</DateText>

        {datePicker.show && (
          <DateTimePicker
            value={date}
            display="spinner"
            onChange={setDate}
            minimumDate={new Date()}
          />
        )}
      </DateButton>
    </Container>
  );
}
