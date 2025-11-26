import { Quote } from './../../quotes/entities/quote.entity';
import { Profile } from './../../profiles/entities/profile.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { UserVisit } from 'src/user_visits/entities/user_visit.entity';
import * as bcrypt from 'bcrypt';

export type AuthProvider = 'email' | 'google' | 'github';
export type UserAccountStatus = 'pending' | 'active' | 'inactive';
export type UserAccountType = 'free' | 'premium';

@Entity({ name: 'users' })
export class User {
  private registrationStep: number = 1;

  @AfterLoad()
  computeRegistrationStep() {
    if (this.email_verified && (this.password || this.provider !== 'email')) {
      this.registrationStep = 4;
    } else if (this.password) {
      this.registrationStep = 3;
    } else if (this.email_verified) {
      this.registrationStep = 2;
    } else {
      this.registrationStep = 1;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone_number?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_picture?: string;

  @CreateDateColumn({ type: 'timestamp' })
  registration_date: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'inactive'],
    default: 'pending',
  })
  status: UserAccountStatus;

  @Column({
    type: 'varchar',
    enum: ['free', 'premium'],
    default: 'free',
  })
  account_type: UserAccountType;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  hashed_email_verification_token?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  hashed_refresh_token?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verification_expiry?: Date | null;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({
    type: 'enum',
    enum: ['email', 'google', 'github'],
    default: 'email',
  })
  provider: AuthProvider;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  provider_id: string | null;

  @Column({ type: 'json', nullable: true })
  provider_data: any;

  @OneToOne(() => Profile, (profile) => profile.user, { nullable: true })
  profile?: Profile;

  @OneToMany(() => Quote, (quote) => quote.user, { nullable: true })
  quotes?: Quote[];

  @OneToMany(() => Ticket, (ticket) => ticket.user, { nullable: true })
  tickets?: Ticket[];

  @OneToMany(() => UserVisit, (visit) => visit.user, { nullable: true })
  visits?: UserVisit[];

  getRegistrationStep(): number {
    return this.registrationStep;
  }
}
