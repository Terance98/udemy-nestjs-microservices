import {
  IsArray,
  IsEmail,
  IsOptional,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';
import { RoleDto } from './role.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  // Validations inside each item of the array is removed since it will take place inside the RoleDto
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => RoleDto)
  roles?: RoleDto[];
}
