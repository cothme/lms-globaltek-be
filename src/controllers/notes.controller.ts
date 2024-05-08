import { RequestHandler } from "express";
import NoteModel from "../models/note.model";
import createHttpError from "http-errors";
import mongoose from "mongoose";

export const getNotes: RequestHandler = async (req, res, next) => {
  try {
    const nodes = await NoteModel.find().exec();
    res.status(200).json(nodes);
  } catch (error) {
    next(error);
  }
};

export const getNote: RequestHandler = async (req, res, next) => {
  const { noteId } = req.params;
  try {
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(500, "Invalid note ID");
    }
    const note = await NoteModel.findOne({ _id: noteId });
    if (!note) {
      throw createHttpError(404, "Note not found");
    }
    return res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

interface CreateNoteBody {
  title?: string;
  text?: string;
}

export const createNotes: RequestHandler<
  unknown,
  unknown,
  CreateNoteBody,
  unknown
> = async (req, res, next) => {
  const { title, text } = req.body;
  try {
    if (!title) {
      throw createHttpError(400, "Note must have a title");
    }

    const newNote = await NoteModel.create({
      title: title,
      text: text,
    });

    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

interface UpdateNodeParams {
  noteId: string;
}
interface updateNoteBody {
  title?: string;
  text?: string;
}

export const updateNote: RequestHandler<
  UpdateNodeParams,
  unknown,
  updateNoteBody,
  unknown
> = async (req, res, next) => {
  const { noteId } = req.params;
  const { title, text } = req.body;
  try {
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(500, "Invalid note ID");
    }
    if (!title) {
      throw createHttpError(400, "Note must have a title");
    }

    const note = await NoteModel.findOne({ _id: noteId }).exec();

    if (!note) {
      throw createHttpError(404, "Note not found");
    }

    await NoteModel.updateOne({ _id: noteId }, { title, text });

    const noteUpdated = await NoteModel.findById({ _id: noteId });
    return res.status(200).json({ data: noteUpdated });
  } catch (error) {
    next(error);
  }
};

export const deleteNote: RequestHandler = async (req, res, next) => {
  const { noteId } = req.params;

  try {
    if (!mongoose.isValidObjectId(noteId)) {
      throw createHttpError(500, "Invalid note ID");
    }
    const note = await NoteModel.findById({ _id: noteId }).exec();
    if (!note) {
      throw createHttpError(404, "Note not found");
    }
    await NoteModel.deleteOne({ _id: noteId });

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
