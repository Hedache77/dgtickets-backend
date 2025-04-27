import moment from 'moment';

/**
 * Formatea campos de fecha de un objeto o un arreglo de objetos.
 * @param data El objeto o arreglo de objetos a formatear.
 * @param dateFields Arreglo de campos de fecha que quieres formatear (por defecto: ['createdAt', 'updatedAt']).
 */
export function formatDates<T extends Record<string, any> | Record<string, any>[]>(
  data: T,
  dateFields: string[] = ['createdAt', 'updatedAt']
): T {
  if (Array.isArray(data)) {
    return data.map((item) => formatObjectDates(item, dateFields)) as T;
  } else {
    return formatObjectDates(data, dateFields) as T;
  }
}

function formatObjectDates(
  obj: Record<string, any>,
  dateFields: string[]
): Record<string, any> {
  const newObj = { ...obj };

  for (const field of dateFields) {
    if (newObj[field]) {
      newObj[field] = moment(newObj[field])
        .utcOffset('-05:00')
        .format('YYYY-MM-DDTHH:mm:ssZ');
    }
  }

  return newObj;
}
