const CourseOutcome = require('../models/CourseOutcomeModel');

// Create a new Course Outcome
// Create a new Course Outcome and update CO-PO Matrix
exports.createCourseOutcome = async (req, res) => {
    try {
        const { course, coNo, courseOutcome, knowledgeLevel } = req.body;

        // Create the new course outcome
        const newCourseOutcome = new CourseOutcome({ course, coNo, courseOutcome, knowledgeLevel });
        await newCourseOutcome.save();

        // Create a new CO-PO Matrix entry for this course outcome
        const newCOPOMatrix = new COPOMatrix({
            course,
            courseOutcome,
            po1: 0, po2: 0, po3: 0, po4: 0, po5: 0, po6: 0, po7: 0, po8: 0, po9: 0, po10: 0, po11: 0, po12: 0
        });

        // Save the CO-PO Matrix entry
        await newCOPOMatrix.save();

        // Respond with the new Course Outcome and CO-PO Matrix
        res.status(201).json({ courseOutcome: newCourseOutcome, coPoMatrix: newCOPOMatrix });
    } catch (error) {
        res.status(500).json({ message: 'Error creating course outcome', error });
    }
};

// Get all Course Outcomes for a specific course
exports.getCourseOutcomes = async (req, res) => {
    try {
        const courseOutcomes = await CourseOutcome.find({ course: req.params.course });
        res.json(courseOutcomes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course outcomes', error });
    }
};

// Partially update a Course Outcome and update corresponding CO-PO Matrix
exports.updateCourseOutcome = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Find the existing Course Outcome
        const existingCourseOutcome = await CourseOutcome.findById(id);
        if (!existingCourseOutcome) {
            return res.status(404).json({ message: 'Course Outcome not found' });
        }

        // Update the Course Outcome
        const updatedCourseOutcome = await CourseOutcome.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        // Update the corresponding CO-PO Matrix if the courseOutcome field has changed
        if (updatedCourseOutcome.courseOutcome !== existingCourseOutcome.courseOutcome) {
            await COPOMatrix.updateMany(
                { courseOutcome: existingCourseOutcome.courseOutcome },
                { courseOutcome: updatedCourseOutcome.courseOutcome }
            );
        }

        res.json({ updatedCourseOutcome, message: 'Course Outcome and CO-PO Matrix updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating course outcome and CO-PO matrix', error });
    }
};



/** Course Outcome and Project Outcome Mapping  */
const COPOMatrix = require('../models/COPOMatrixModel');

// Create a new CO-PO Matrix entry
exports.createCOPOMatrix = async (req, res) => {
    try {
        const { course, courseOutcome, po1, po2, po3, po4, po5, po6, po7, po8, po9, po10, po11, po12 } = req.body;

        // Creating a new CO-PO matrix entry with the course field
        const newCOPOMatrix = new COPOMatrix({
            course, 
            courseOutcome, 
            po1, po2, po3, po4, po5, po6, po7, po8, po9, po10, po11, po12
        });

        // Saving the new entry to the database
        await newCOPOMatrix.save();
        
        // Sending the response back with the created CO-PO matrix entry
        res.status(201).json(newCOPOMatrix);
    } catch (error) {
        res.status(500).json({ message: 'Error creating CO-PO Matrix', error });
    }
};


// Get CO-PO Matrix entries for a specific course
exports.getCOPOMatrix = async (req, res) => {
    try {
        const { course } = req.params;  // Get subject from URL parameters
        console.log('Querying for subject:', course);  // Log subject to debug
        const coPoMatrix = await COPOMatrix.find({ course: course });

        // Check if results are empty and log
        if (coPoMatrix.length === 0) {
            console.log('No CO-PO Matrix found for:', course);
        }

        res.json(coPoMatrix);  // Respond with the CO-PO Matrix data
    } catch (error) {
        console.log('Error:', error);  // Log the error if any
        res.status(500).json({ message: 'Error fetching CO-PO Matrix', error });
    }
};

// Partially update a CO-PO Matrix entry
exports.updateCOPOMatrix = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedCOPOMatrix = await COPOMatrix.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!updatedCOPOMatrix) {
            return res.status(404).json({ message: 'CO-PO Matrix entry not found' });
        }

        res.json(updatedCOPOMatrix);
    } catch (error) {
        res.status(500).json({ message: 'Error updating CO-PO Matrix', error });
    }
};
