import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const validateAndTransformDto = async <T extends ClassConstructor<any>>(
  dto: T,
  obj: object,
): Promise<{ errors: string[]; validatedObj }> => {
  // tranform the literal object to class object
  const objInstance = plainToInstance(dto, obj);
  // validating and check the errors, throw the errors if exist
  const errorsUnformatted = await validate(objInstance);
  const errors = errorsUnformatted.map(({ property, constraints }) => {
    return `${property} - ${JSON.stringify(constraints)}`;
  });
  return { errors, validatedObj: objInstance };
};
