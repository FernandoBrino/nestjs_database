import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/typeorm/entities/Post';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import {
  CreateUserParams,
  CreateUserPostParams,
  CreateUserProfileParams,
  UpdateUserParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  fetchUsers() {
    return this.userRepository.find({ relations: ['profile', 'posts'] });
  }

  createUsers(userDetails: CreateUserParams) {
    const newUser = this.userRepository.create({
      ...userDetails,
      created_at: new Date(),
    });

    return this.userRepository.save(newUser);
  }

  updateUser(id: number, updateUserDetails: UpdateUserParams) {
    return this.userRepository.update({ id }, { ...updateUserDetails });
  }

  deleteUser(id: number) {
    return this.userRepository.delete({ id });
  }

  async createUserProfile(
    id: number,
    createUserProfile: CreateUserProfileParams,
  ) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new HttpException(
        'User not found. Cannot create user profile',
        HttpStatus.BAD_REQUEST,
      );

    const newProfile = this.profileRepository.create(createUserProfile);
    const savedProfile = await this.profileRepository.save(newProfile);

    user.profile = savedProfile;

    return this.userRepository.save(user);
  }

  async createUserPost(id: number, createUserProfile: CreateUserPostParams) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new HttpException(
        'User not found. Cannot create user profile',
        HttpStatus.BAD_REQUEST,
      );

    const newPost = this.postRepository.create({
      ...createUserProfile,
      user,
    });
    return this.postRepository.save(newPost);
  }
}
