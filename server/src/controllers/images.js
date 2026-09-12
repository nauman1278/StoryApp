const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { imageSize } = require('image-size');
const projectRepository = require('../repositories/projects');
const sceneRepository = require('../repositories/scenes');

// Setup multer storage
// We will use memory storage temporarily to validate the image before saving it to disk
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

exports.uploadMiddleware = upload.single('image');

exports.uploadSceneImage = (req, res) => {
    try {
        const { projectId, sceneId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const project = projectRepository.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const scene = sceneRepository.findById(sceneId);
        if (!scene || scene.projectId !== project.id) {
            return res.status(404).json({ error: 'Scene not found in this project' });
        }

        // Validate image
        const buffer = req.file.buffer;
        let dimensions;
        try {
            dimensions = imageSize(buffer);
        } catch (e) {
            console.error('imageSize error:', e);
            return res.status(400).json({ error: 'Invalid or corrupted image file' });
        }

        const validTypes = ['jpg', 'png', 'webp', 'jpeg'];
        if (!validTypes.includes(dimensions.type)) {
            return res.status(400).json({ error: 'Unsupported image type. Use JPG, PNG, or WEBP' });
        }

        // Validate aspect ratio (16:9, 9:16, 1:1)
        const ratio = dimensions.width / dimensions.height;
        let targetRatio = 16 / 9;
        let expectedText = '16:9 (~1.77)';

        if (project.aspectRatio === '9:16') {
            targetRatio = 9 / 16;
            expectedText = '9:16 (~0.56)';
        } else if (project.aspectRatio === '1:1') {
            targetRatio = 1;
            expectedText = '1:1 (1.00)';
        }

        // Allow a small margin of error (approx 5%)
        if (Math.abs(ratio - targetRatio) > (targetRatio * 0.05)) {
            return res.status(400).json({ error: `Image aspect ratio is ${ratio.toFixed(2)}, expected ${expectedText}` });
        }

        // Create project directories if they don't exist
        const projectDir = path.join(__dirname, '../../../output', project.name);
        const imagesDir = path.join(projectDir, 'images');
        
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Save image securely
        const paddedNumber = String(scene.sceneNumber).padStart(3, '0');
        const filename = `scene_${paddedNumber}.${dimensions.type === 'jpeg' ? 'jpg' : dimensions.type}`;
        const filePath = path.join(imagesDir, filename);

        fs.writeFileSync(filePath, buffer);

        // Update scene record
        const relativePath = path.join(project.name, 'images', filename).replace(/\\\\/g, '/');
        
        const updatedScene = sceneRepository.update(scene.id, {
            imagePath: relativePath,
            status: 'IMAGE_READY' // Only mark as image ready, narration might still be needed
        });

        res.json({
            success: true,
            scene: updatedScene,
            dimensions: { width: dimensions.width, height: dimensions.height }
        });

    } catch (err) {
        console.error('Image upload error:', err);
        res.status(500).json({ error: err.message });
    }
};
