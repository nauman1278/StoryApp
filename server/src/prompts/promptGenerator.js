class PromptGenerator {
    constructor(project, characters) {
        this.project = project;
        this.characters = characters || [];
    }

    generateForScene(scene) {
        if (this.project.visualStyle === 'Cinematic') {
            return this.generateCinematic(scene);
        } else if (this.project.visualStyle === 'Vintage') {
            return this.generateVintage(scene);
        }
        
        throw new Error('Unknown visual style');
    }

    generateCinematic(scene) {
        // Find which characters are mentioned in this scene
        const mentionedCharacters = this.characters.filter(c => 
            scene.script.toLowerCase().includes(c.name.toLowerCase())
        );

        let characterDescriptions = mentionedCharacters.map(c => `[CHARACTER: ${c.name} - EXACT APPEARANCE: ${c.appearanceLock}]`).join(' ');

        let ratioText = "16:9 landscape framing.";
        if (this.project.aspectRatio === '9:16') ratioText = "9:16 vertical portrait framing.";
        else if (this.project.aspectRatio === '1:1') ratioText = "1:1 perfectly square framing.";

        return `SUBJECT AND ACTION: ${scene.script.replace(/\n/g, ' ')}
        
INVOLVED CHARACTERS (STRICT CONSISTENCY REQUIRED): 
${characterDescriptions ? characterDescriptions : 'No specific recurring characters.'}

ENVIRONMENT AND LIGHTING:
Natural cinematic composition, soft realistic shading, subtle cinematic lighting.

ART STYLE:
Professional cinematic digital story illustration, semi-realistic, clean linework, educational visual storytelling, expressive emotions, extremely consistent character design. ${ratioText}

NEGATIVE PROMPT:
No watermark, no logo, no text, no distorted anatomy, no duplicate characters, no clutter.`;
    }

    generateVintage(scene) {
        let ratioText = "16:9 landscape frame.";
        if (this.project.aspectRatio === '9:16') ratioText = "9:16 vertical portrait frame.";
        else if (this.project.aspectRatio === '1:1') ratioText = "1:1 square frame.";

        return `Create a minimalist vintage educational story illustration.

SCENE:
${scene.script}

VISUAL STYLE:
1950s educational book illustration, black ink line drawing, retro editorial artwork, clean monochrome linework, classic English-learning textbook illustration, subtle vintage appearance.

BACKGROUND:
Warm aged cream paper, subtle natural grain, light vintage paper texture, minimal visual noise.

COMPOSITION:
${ratioText} Keep approximately 65-75% of the frame visually empty (blank paper) on the top and left side. Place the illustration EXCLUSIVELY in the bottom-right corner of the composition. Maintain strong negative space.

CONSTRAINTS:
NO TEXT. NO WORDS. NO LETTERS. NO CAPTIONS. NO LOGOS. NO WATERMARKS. No modern graphical elements. Minimal uncluttered composition.`;
    }
}

module.exports = PromptGenerator;
