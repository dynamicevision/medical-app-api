import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column({
    unique: true,
  })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ length: 60 })
  password: string;

  @Column({ nullable: false, default: 'user' })
  role: string;
}
