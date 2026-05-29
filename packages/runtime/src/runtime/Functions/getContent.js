export async function getContent(content) {
    // Assumes content prop is passed.
    let contentId = content?._content

    if (this.getContent == null || contentId == null) {  
        return null

    // Call the getContent property assigned to the runtime with the contentId.
    } else {
        return await this.getContent(contentId)
    }
}