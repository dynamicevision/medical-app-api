import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class CommonEntity {
  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn({ nullable: true, type: 'timestamptz' })
  createdOn: Date;

  @Column({ nullable: true })
  lastModifiedBy: number;

  @UpdateDateColumn({ nullable: true, type: 'timestamptz' })
  lastModifiedOn: Date;
}
