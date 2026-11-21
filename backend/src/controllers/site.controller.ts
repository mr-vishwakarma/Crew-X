import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { Site } from '../models/site.model.js';
import { Project } from '../models/project.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class SiteController {
  /**
   * GET /api/sites
   * List sites with search, filters (projectId, siteType, status), and pagination
   */
  static async listSites(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'User organization context missing', 400);
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const { search, projectId, siteType, status, isArchived } = req.query;

      const filter: Record<string, any> = {
        organizationId: orgId,
        isArchived: isArchived === 'true' ? true : false,
      };

      if (projectId && typeof projectId === 'string') {
        filter.projectId = projectId;
      }

      if (siteType && typeof siteType === 'string') {
        filter.siteType = siteType;
      }

      if (status && typeof status === 'string') {
        filter.status = status;
      }

      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ siteName: regex }, { siteCode: regex }, { address: regex }, { city: regex }];
      }

      const [total, sites] = await Promise.all([
        Site.countDocuments(filter),
        Site.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('projectId', 'projectName projectCode status priority')
          .lean(),
      ]);

      const formattedSites = sites.map((s: any) => ({
        id: s._id.toString(),
        ...s,
        _id: undefined,
      }));

      sendSuccess(
        res,
        {
          sites: formattedSites,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
        'Sites retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve sites';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/sites/:id
   * Get single site details
   */
  static async getSiteById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const site = await Site.findOne({
        _id: id,
        organizationId: orgId,
      }).populate('projectId', 'projectName projectCode status priority location');

      if (!site) {
        sendError(res, 'Site not found or unauthorized', 404);
        return;
      }

      sendSuccess(res, site.toJSON(), 'Site details retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve site';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/sites
   * Create new site under a valid project
   */
  static async createSite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const { projectId, siteCode } = req.body;

      // Validate project exists and belongs to this organization
      const project = await Project.findOne({
        _id: projectId,
        organizationId: orgId,
        isArchived: false,
      });

      if (!project) {
        sendError(res, 'Selected project does not exist or is archived', 400);
        return;
      }

      // Check unique siteCode in organization
      const existing = await Site.findOne({
        organizationId: orgId,
        siteCode: siteCode.toUpperCase(),
      });

      if (existing) {
        sendError(res, `Site code '${siteCode.toUpperCase()}' already exists in your organization`, 409);
        return;
      }

      const site = await Site.create({
        ...req.body,
        siteCode: siteCode.toUpperCase(),
        organizationId: orgId,
        createdBy: userId,
      });

      const populatedSite = await Site.findById(site._id).populate(
        'projectId',
        'projectName projectCode'
      );

      sendSuccess(res, populatedSite?.toJSON(), 'Site created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create site';
      sendError(res, message, 500);
    }
  }

  /**
   * PUT /api/sites/:id
   * Update site details
   */
  static async updateSite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const site = await Site.findOne({
        _id: id,
        organizationId: orgId,
      });

      if (!site) {
        sendError(res, 'Site not found or unauthorized', 404);
        return;
      }

      const {
        projectId,
        siteName,
        description,
        siteType,
        address,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        siteManager,
        status,
      } = req.body;

      // If projectId is changing, verify the new project belongs to org
      if (projectId && projectId !== site.projectId.toString()) {
        const project = await Project.findOne({
          _id: projectId,
          organizationId: orgId,
          isArchived: false,
        });

        if (!project) {
          sendError(res, 'Selected project does not exist or is archived', 400);
          return;
        }
        site.projectId = projectId as any;
      }

      if (siteName) site.siteName = siteName;
      if (description !== undefined) site.description = description;
      if (siteType) site.siteType = siteType;
      if (address) site.address = address;
      if (city !== undefined) site.city = city;
      if (state !== undefined) site.state = state;
      if (country !== undefined) site.country = country;
      if (postalCode !== undefined) site.postalCode = postalCode;
      if (latitude !== undefined) site.latitude = latitude;
      if (longitude !== undefined) site.longitude = longitude;
      if (siteManager !== undefined) site.siteManager = siteManager;
      if (status) site.status = status;

      await site.save();

      const updatedSite = await Site.findById(site._id).populate(
        'projectId',
        'projectName projectCode'
      );

      sendSuccess(res, updatedSite?.toJSON(), 'Site updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update site';
      sendError(res, message, 500);
    }
  }

  /**
   * PATCH /api/sites/:id/archive
   * Safe archive site
   */
  static async archiveSite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const site = await Site.findOne({
        _id: id,
        organizationId: orgId,
      });

      if (!site) {
        sendError(res, 'Site not found or unauthorized', 404);
        return;
      }

      site.isArchived = true;
      await site.save();

      sendSuccess(res, site.toJSON(), 'Site archived successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to archive site';
      sendError(res, message, 500);
    }
  }
}
