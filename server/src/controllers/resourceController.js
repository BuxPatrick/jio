import { 
  Consulate, 
  Lawyer, 
  CivilSurgeon, 
  Shelter, 
  ICEResource,
  calculateDistance 
} from '../models/Resource.js';

// Generic controller factory for all resource types
const createResourceController = (Model, resourceName) => {
  return {
    // Get all resources with optional filtering
    getAll: async (req, res) => {
      try {
        const { 
          city, 
          state, 
          lat, 
          lng, 
          radius = 50, // km
          limit = 50,
          page = 1,
          sortBy = 'rating'
        } = req.query;

        let query = { isActive: true };
        
        // Filter by location (city/state)
        if (city) query['address.city'] = new RegExp(city, 'i');
        if (state) query['address.state'] = new RegExp(state, 'i');

        let resources;

        // If coordinates provided, use geospatial query
        if (lat && lng) {
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);
          
          resources = await Model.find({
            ...query,
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [longitude, latitude]
                },
                $maxDistance: parseInt(radius) * 1000 // Convert km to meters
              }
            }
          })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));

          // Calculate distance for each resource
          resources = resources.map(resource => {
            const doc = resource.toObject();
            doc.distance = calculateDistance(
              latitude, 
              longitude, 
              doc.location.coordinates[1], 
              doc.location.coordinates[0]
            ).toFixed(1);
            return doc;
          });
        } else {
          // Regular query without geospatial filtering
          resources = await Model.find(query)
            .sort({ [sortBy]: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        }

        const total = await Model.countDocuments(query);

        res.json({
          success: true,
          data: resources,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: `Error fetching ${resourceName}`, 
          error: error.message 
        });
      }
    },

    // Get single resource by ID
    getById: async (req, res) => {
      try {
        const resource = await Model.findById(req.params.id);
        if (!resource) {
          return res.status(404).json({ 
            success: false, 
            message: `${resourceName} not found` 
          });
        }
        res.json({ success: true, data: resource });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: `Error fetching ${resourceName}`, 
          error: error.message 
        });
      }
    },

    // Create new resource
    create: async (req, res) => {
      try {
        const resource = new Model(req.body);
        await resource.save();
        res.status(201).json({ 
          success: true, 
          data: resource,
          message: `${resourceName} created successfully`
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: `Error creating ${resourceName}`, 
          error: error.message 
        });
      }
    },

    // Update resource
    update: async (req, res) => {
      try {
        const resource = await Model.findByIdAndUpdate(
          req.params.id,
          { ...req.body, updatedAt: Date.now() },
          { new: true, runValidators: true }
        );
        if (!resource) {
          return res.status(404).json({ 
            success: false, 
            message: `${resourceName} not found` 
          });
        }
        res.json({ 
          success: true, 
          data: resource,
          message: `${resourceName} updated successfully`
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: `Error updating ${resourceName}`, 
          error: error.message 
        });
      }
    },

    // Delete resource
    delete: async (req, res) => {
      try {
        const resource = await Model.findByIdAndUpdate(
          req.params.id,
          { isActive: false, updatedAt: Date.now() },
          { new: true }
        );
        if (!resource) {
          return res.status(404).json({ 
            success: false, 
            message: `${resourceName} not found` 
          });
        }
        res.json({ 
          success: true, 
          message: `${resourceName} deleted successfully`
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: `Error deleting ${resourceName}`, 
          error: error.message 
        });
      }
    },

    // Search resources by keyword
    search: async (req, res) => {
      try {
        const { q, limit = 20 } = req.query;
        
        if (!q) {
          return res.status(400).json({ 
            success: false, 
            message: 'Search query is required' 
          });
        }

        const searchRegex = new RegExp(q, 'i');
        
        const resources = await Model.find({
          isActive: true,
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { 'address.city': searchRegex },
            { 'address.state': searchRegex }
          ]
        })
        .limit(parseInt(limit))
        .sort({ rating: -1 });

        res.json({
          success: true,
          data: resources,
          count: resources.length
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: `Error searching ${resourceName}`, 
          error: error.message 
        });
      }
    }
  };
};

// Create controllers for each resource type
export const consulateController = createResourceController(Consulate, 'Consulate');
export const lawyerController = createResourceController(Lawyer, 'Lawyer');
export const surgeonController = createResourceController(CivilSurgeon, 'Civil Surgeon');
export const shelterController = createResourceController(Shelter, 'Shelter');
export const iceResourceController = createResourceController(ICEResource, 'ICE Resource');
