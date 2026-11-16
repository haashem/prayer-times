import { createTickButtonLayout } from '../../../utils/tick-button-layout';

export function createTimePickerLayout(square) {
    const { button, icon } = createTickButtonLayout(square);
    return { square, pickerConfirmButton: button, pickerConfirmIcon: icon };
}
