import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { Organization } from '../models/organization.model.js';
import { Project } from '../models/project.model.js';
import { Site } from '../models/site.model.js';
import { User } from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class OrganizationController {
  /**
   * GET /api/organization/me
   * Fetches organization for current user's organizationId
   */
  static async getOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'User organization context missing', 400);
        return;
      }

      let org = await Organization.findOne({
        $or: [{ code: orgId }, { _id: orgId.match(/^[0-9a-fA-F]{24}$/) ? orgId : null }],
      });

      // If no custom organization document exists yet, create an initial default one
      if (!org) {
        org = await Organization.create({
          name: 'Nirikshan Infrastructure Corp',
          code: orgId.toUpperCase(),
          description: 'Pioneering infrastructure, construction, and quality compliance management.',
          industry: 'Infrastructure & Construction',
          officialEmail: 'operations@nirikshan.org',
          contactNumber: '+91 98765 43210',
          address: '124 Industrial Tech Park, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          country: 'India',
          postalCode: '201301',
          status: 'ACTIVE',
        });
      }

      sendSuccess(res, org.toJSON(), 'Organization details retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve organization';
      sendError(res, message, 500);
    }
  }

  /**
   * PUT /api/organization/me
   * Updates organization details (ADMIN only)
   */
  static async updateOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'User organization context missing', 400);
        return;
      }

      let org = await Organization.findOne({
        $or: [{ code: orgId }, { _id: orgId.match(/^[0-9a-fA-F]{24}$/) ? orgId : null }],
      });

      if (!org) {
        org = new Organization({
          code: orgId.toUpperCase(),
        });
      }

      const {
        name,
        code,
        description,
        industry,
        officialEmail,
        contactNumber,
        address,
        city,
        state,
        country,
        postalCode,
        logoUrl,
      } = req.body;

      // Check unique code if changed
      if (code && code.toUpperCase() !== org.code) {
        const existing = await Organization.findOne({
          code: code.toUpperCase(),
          _id: { $ne: org._id },
        });
        if (existing) {
          sendError(res, `Organization code '${code}' is already registered to another account`, 409);
          return;
        }
        org.code = code.toUpperCase();
      }

      if (name) org.name = name;
      if (description !== undefined) org.description = description;
      if (industry !== undefined) org.industry = industry;
      if (officialEmail !== undefined) org.officialEmail = officialEmail;
      if (contactNumber !== undefined) org.contactNumber = contactNumber;
      if (address !== undefined) org.address = address;
      if (city !== undefined) org.city = city;
      if (state !== undefined) org.state = state;
      if (country !== undefined) org.country = country;
      if (postalCode !== undefined) org.postalCode = postalCode;
      if (logoUrl !== undefined) org.logoUrl = logoUrl;

      await org.save();

      sendSuccess(res, org.toJSON(), 'Organization details updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update organization';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/organization/dashboard-stats
   * Aggregates real-time counts for the Administrator Dashboard
   */
  static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'User organization context missing', 400);
        return;
      }

      const [
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalSites,
        activeSites,
        maintenanceSites,
        supervisorsCount,
        inspectorsCount,
        recentProjects,
        recentSites,
      ] = await Promise.all([
        Project.countDocuments({ organizationId: orgId, isArchived: false }),
        Project.countDocuments({ organizationId: orgId, status: 'ACTIVE', isArchived: false }),
        Project.countDocuments({ organizationId: orgId, status: 'COMPLETED', isArchived: false }),
        Project.countDocuments({ organizationId: orgId, status: 'ON_HOLD', isArchived: false }),
        Site.countDocuments({ organizationId: orgId, isArchived: false }),
        Site.countDocuments({ organizationId: orgId, status: 'ACTIVE', isArchived: false }),
        Site.countDocuments({
          organizationId: orgId,
          status: 'UNDER_MAINTENANCE',
          isArchived: false,
        }),
        User.countDocuments({ organizationId: orgId, role: 'SUPERVISOR', isActive: true }),
        User.countDocuments({ organizationId: orgId, role: 'INSPECTOR', isActive: true }),
        Project.find({ organizationId: orgId, isArchived: false })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select('projectName projectCode status priority location updatedAt'),
        Site.find({ organizationId: orgId, isArchived: false })
          .populate('projectId', 'projectName projectCode')
          .sort({ updatedAt: -1 })
          .limit(5)
          .select('siteName siteCode siteType status city state updatedAt'),
      ]);

      sendSuccess(
        res,
        {
          projects: {
            total: totalProjects,
            active: activeProjects,
            completed: completedProjects,
            onHold: onHoldProjects,
          },
          sites: {
            total: totalSites,
            active: activeSites,
            underMaintenance: maintenanceSites,
          },
          personnel: {
            supervisors: supervisorsCount,
            inspectors: inspectorsCount,
          },
          recentProjects,
          recentSites,
        },
        'Dashboard statistics retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve stats';
      sendError(res, message, 500);
    }
  }
}
