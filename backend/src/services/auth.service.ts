import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../config';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, station: true, region: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('User is deactivated');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        role: user.role.name,
        stationId: user.stationId,
        regionId: user.regionId
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        station: user.station,
        region: user.region
      }
    };
  }

  async refreshToken(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) throw new Error('User not found');

    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        role: user.role.name,
        stationId: user.stationId,
        regionId: user.regionId
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );
  }

  async createUser(
    email: string,
    password: string,
    fullName: string,
    roleId: string,
    stationId?: string,
    regionId?: string
  ) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        roleId,
        stationId,
        regionId
      },
      include: { role: true }
    });
  }
}

export const authService = new AuthService();
