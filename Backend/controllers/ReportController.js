import User from '../models/User.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import { DISTRICTS } from '../config/districts.js';

export const generateSystemReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        const hospitalId = req.query.hospitalId || (req.user?.role === 'hospital' ? req.user.id : undefined)
        const dateFilter = {}
        const hospitalFilter = hospitalId ? { hospital: hospitalId } : {}

        if (startDate || endDate) {
            dateFilter.createdAt = {}
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
        }

        const requestFilter = { ...dateFilter, ...hospitalFilter }

                const totalDonors = hospitalId
                        ? await EmergencyRequest.aggregate([
                                { $match: { hospital: hospitalId, ...dateFilter } },
                                { $unwind: '$matchedDonors' },
                                { $group: { _id: '$matchedDonors' } },
                                { $count: 'count' },
                            ]).then((result) => (result[0] ? result[0].count : 0))
                        : await Donor.countDocuments(dateFilter);
        const totalRequests = await EmergencyRequest.countDocuments(requestFilter);
        const pendingRequests = await EmergencyRequest.countDocuments({ ...requestFilter, status: 'Pending' });
        const totalHospitals = hospitalId ? 1 : await Hospital.countDocuments();
        const hospitalsList = hospitalId
            ? await Hospital.find({ _id: hospitalId }).select('name district address phone email status').lean()
            : await Hospital.find().select('name district address phone email status').sort({ createdAt: -1 }).lean();

        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                const districtBloodGroups = await Donor.aggregate([
                { $match: dateFilter },
                { $group: { _id: { district: '$district', bloodGroup: '$bloodGroup' }, count: { $sum: 1 } } },
              ])

        const districtBloodMap = districtBloodGroups.reduce((map, item) => {
            const district = item._id.district
            if (!map[district]) map[district] = {}
            map[district][item._id.bloodGroup] = item.count
            return map
        }, {})

        const districtStats = await Promise.all(DISTRICTS.map(async (district) => {
            const [donors, hospitals] = await Promise.all([
                Donor.countDocuments({ district, ...dateFilter }),
                Hospital.countDocuments({ district, ...dateFilter }),
            ])

            return {
                district,
                donors,
                hospitals,
                bloodGroups: bloodTypes.map((bloodGroup) => ({
                    bloodGroup,
                    donors: districtBloodMap[district]?.[bloodGroup] || 0,
                })),
            }
        }));

        const inventoryItems = await BloodInventory.find(hospitalFilter);
        const totalUnits = inventoryItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

        const groupMap = inventoryItems.reduce((map, item) => {
            const type = item.bloodType || item.bloodType?.toUpperCase?.() || 'UNKNOWN'
            map[type] = (map[type] || 0) + (item.quantity || 0)
            return map
        }, {})

        const bloodGroupStats = bloodTypes.map((bloodGroup) => ({
            bloodGroup,
            units: groupMap[bloodGroup] || 0,
        }))

                const registeredDonorBloodGroups = hospitalId ? [] : await Donor.aggregate([
                                { $match: dateFilter },
                                { $group: { _id: '$bloodGroup', donors: { $sum: 1 } } },
                            ]).then((groups) => {
                                const counts = groups.reduce((map, group) => {
                                        map[group._id] = group.donors
                                        return map
                                }, {})

                                return bloodTypes.map((bloodGroup) => ({
                                        bloodGroup,
                                        donors: counts[bloodGroup] || 0,
                                }))
                            })

        const recentRequests = await EmergencyRequest.find(requestFilter).sort({ createdAt: -1 }).limit(6).populate('hospital', 'name location')

        const reportData = {
            generatedAt: new Date(),
            totalDonors,
            totalRequests,
            pendingRequests,
            totalHospitals,
            hospitalsList,
            districtStats,
            totalUnits,
            bloodGroupStats,
            registeredDonorBloodGroups,
            inventoryDetails: inventoryItems,
            recentRequests,
        }

        return res.status(200).json({
            success: true,
            message: "System report generated successfully",
            data: reportData
        });
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Error generating system report",
                error: error.message
            });
        }
    }
};