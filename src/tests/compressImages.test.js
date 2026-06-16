import { jest } from '@jest/globals';

// Mock sharp before the module is imported
const mockSharpInstance = {
  resize: jest.fn().mockReturnThis(),
  jpeg:   jest.fn().mockReturnThis(),
  toFile: jest.fn().mockResolvedValue({}),
};
jest.mock('sharp', () => jest.fn(() => mockSharpInstance));

import { makeCompressImages } from '../services/imageCompressor.js';
import sharp from 'sharp';

const FAKE_UPLOAD_DIR = '/fake/upload/dir';
const compressImages = makeCompressImages(FAKE_UPLOAD_DIR);

describe('compressImages middleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
    jest.clearAllMocks();
    // Re-attach chain after clearAllMocks
    mockSharpInstance.resize.mockReturnThis();
    mockSharpInstance.jpeg.mockReturnThis();
    mockSharpInstance.toFile.mockResolvedValue({});
    sharp.mockReturnValue(mockSharpInstance);
  });

  it('calls next() immediately when req.files is undefined', async () => {
    const req = {};
    await compressImages(req, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(sharp).not.toHaveBeenCalled();
  });

  it('processes each file buffer through sharp', async () => {
    const buffer = Buffer.from('fake-image');
    const req = {
      files: {
        frente:   [{ buffer, originalname: 'front.jpg' }],
        traseira: [{ buffer, originalname: 'back.jpg' }],
      },
    };

    await compressImages(req, {}, next);

    expect(sharp).toHaveBeenCalledTimes(2);
    expect(mockSharpInstance.resize).toHaveBeenCalledWith({ width: 1280, withoutEnlargement: true });
    expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 75 });
    expect(mockSharpInstance.toFile).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets file.path and file.filename after compression', async () => {
    const buffer = Buffer.from('img');
    const file = { buffer, originalname: 'photo.png' };
    const req = { files: { frente: [file] } };

    await compressImages(req, {}, next);

    expect(file.path).toBeDefined();
    expect(file.filename).toMatch(/\.jpg$/);
  });

  it('calls next(err) when sharp throws', async () => {
    mockSharpInstance.toFile.mockRejectedValue(new Error('Sharp failed'));
    const req = {
      files: { frente: [{ buffer: Buffer.from('x'), originalname: 'img.jpg' }] },
    };

    await compressImages(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
