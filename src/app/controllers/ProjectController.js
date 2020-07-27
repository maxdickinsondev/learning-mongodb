const Project = require('../models/Project');
const Task = require('../models/Tasks');

class ProjectController {
  async index(req, res) {
    try {
      const projects = await Project.find().populate(['user', 'tasks']);

      return res.send({ projects });
    } catch (err) {
      return res.status(400).send({ error: 'Error listing projects' });
    }
  }

  async show(req, res) {
    const { id } = req.params;

    try {
      const project = await Project.findById(id).populate(['user', 'tasks']);

      return res.send({ project });
    } catch (err) {
      return res.status(400).send({ error: 'Error listing project' });
    }
  }

  async create(req, res) {
    const { title, description, tasks } = req.body;

    try {
      const project = await Project.create({ title, description, user: req.userId });

      await Promise.all(tasks.map(async task => {
        const projectTask = new Task({ ...task, project: project._id });

        await projectTask.save();
        
        project.tasks.push(projectTask);
      }));

      await project.save();

      return res.send({ project });
    } catch (err) {
      return res.status(400).send({ error: 'Error creating new projecting' });
    }
  }

  async update(req, res) {
    const { title, description, tasks } = req.body;
    const { id } = req.params;

    try {
      const project = await Project.findByIdAndUpdate(id, {
        title,
        description
      }, { new: true });

      project.tasks = [];
      await Task.remove({ project: project._id });

      await Promise.all(tasks.map(async task => {
        const projectTask = new Task({ ...task, project: project._id });

        await projectTask.save();
        
        project.tasks.push(projectTask);
      }));

      await project.save();

      return res.send({ project });
    } catch (err) {
      return res.status(400).send({ error: 'Error updating project' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      await Project.findByIdAndRemove(id);

      return res.send({ id });
    } catch (err) {
      return res.status(400).send({ error: 'Error removing project' });
    }
  }
}

module.exports = new ProjectController();